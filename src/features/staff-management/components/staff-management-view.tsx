'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Icons } from '@/components/icons';
import { StaffInvitation, StaffMember, staffManagementApi } from '../api/staff-management.api';
import { InviteStaffModal } from './invite-staff-modal';
import { StaffRosterModal } from './staff-roster-modal';
import { StaffDetailEditModal } from './staff-detail-edit-modal';
import { StaffScheduleCard } from './staff-schedule-card';

function renderRoleBadge() {
  return (
    <Badge className='bg-amber-600/15 text-amber-700 dark:text-amber-400 border-amber-500/30'>
      Staf Operasional
    </Badge>
  );
}

function renderStatusBadge(status: string) {
  switch (status) {
    case 'accepted':
      return (
        <Badge className='bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'>
          Diterima
        </Badge>
      );
    case 'pending':
      return (
        <Badge className='bg-amber-600/15 text-amber-700 dark:text-amber-400 border-amber-500/30'>
          Menunggu
        </Badge>
      );
    case 'revoked':
      return (
        <Badge className='bg-destructive/15 text-destructive border-destructive/30'>
          Dibatalkan
        </Badge>
      );
    case 'expired':
      return (
        <Badge variant='outline' className='text-muted-foreground'>
          Kedaluwarsa
        </Badge>
      );
    default:
      return <Badge variant='outline'>{status}</Badge>;
  }
}

export function StaffManagementView() {
  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members');
  const [staffs, setStaffs] = useState<StaffMember[]>([]);
  const [invitations, setInvitations] = useState<StaffInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Selection
  const [isInviteStaffOpen, setIsInviteStaffOpen] = useState(false);
  const [selectedStaffForRoster, setSelectedStaffForRoster] = useState<StaffMember | null>(null);
  const [selectedStaffForDetail, setSelectedStaffForDetail] = useState<StaffMember | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const reloadData = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    if (refreshKey < 0) return;
    let cancelled = false;

    Promise.all([staffManagementApi.getAllStaffs(), staffManagementApi.getInvitations()])
      .then(([staffList, inviteList]) => {
        if (cancelled) return;
        setStaffs(staffList);
        setInvitations(inviteList);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Gagal memuat data staf dan undangan.';
        toast.error(msg);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const handleRevokeInvitation = async (id: string, email: string) => {
    if (!confirm(`Batalkan undangan untuk ${email}?`)) return;
    try {
      setLoading(true);
      await staffManagementApi.revokeInvitation(id);
      toast.success(`Undangan untuk ${email} berhasil dibatalkan.`);
      reloadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membatalkan undangan.';
      toast.error(msg);
      setLoading(false);
    }
  };

  const filteredStaffs = staffs.filter((s) => {
    const q = searchQuery.toLowerCase();
    return s.fullName.toLowerCase().includes(q) || (s.email && s.email.toLowerCase().includes(q));
  });

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col gap-4 select-none'>
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'members' | 'invitations')}
        className='flex flex-1 min-h-0 flex-col gap-4'
      >
        {/* Desktop & Mobile Responsive Toolbar Row matching DoctorScheduleView */}
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0'>
          <div className='flex flex-wrap items-center gap-2.5 flex-1'>
            <div className='relative w-full sm:w-72'>
              <Icons.search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Cari nama atau email staf...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-8 h-9 text-xs'
              />
            </div>

            <TabsList className='grid grid-cols-2 h-9'>
              <TabsTrigger value='members' className='text-xs gap-1.5 px-3'>
                <Icons.users className='h-3.5 w-3.5' />
                Staf ({staffs.length})
              </TabsTrigger>
              <TabsTrigger value='invitations' className='text-xs gap-1.5 px-3'>
                <Icons.mail className='h-3.5 w-3.5' />
                Undangan ({invitations.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <div className='flex items-center gap-2 shrink-0 justify-end'>
            <Button onClick={() => setIsInviteStaffOpen(true)} size='sm' className='h-9 gap-1.5'>
              <Icons.userPlus className='h-4 w-4' />
              Undang Staf
            </Button>
          </div>
        </div>

        {/* Tab 1: Daftar Staf (Clean Cards Grid in ScrollArea) */}
        <TabsContent
          value='members'
          className='relative flex flex-1 min-h-0 flex-col overflow-hidden m-0'
        >
          {loading ? (
            <div className='absolute inset-0 flex overflow-hidden'>
              <ScrollArea className='h-full w-full pr-0 md:pr-3'>
                <div className='pb-20 pt-1'>
                  <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5'>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className='h-[200px] rounded-[24px] bg-muted/20 animate-pulse border border-border/40'
                      />
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>
          ) : filteredStaffs.length === 0 ? (
            <div className='flex flex-1 min-h-0 h-full w-full flex-col'>
              <EmptyState
                icon={Icons.users}
                title='Tidak ada staf operasional ditemukan'
                description={
                  searchQuery
                    ? `Tidak ada staf yang sesuai dengan kata kunci "${searchQuery}".`
                    : 'Belum ada staf operasional yang terdaftar di klinik.'
                }
                action={
                  searchQuery ? (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setSearchQuery('')}
                      className='text-xs'
                    >
                      Reset Pencarian
                    </Button>
                  ) : (
                    <Button
                      size='sm'
                      onClick={() => setIsInviteStaffOpen(true)}
                      className='text-xs gap-1.5'
                    >
                      <Icons.userPlus className='h-3.5 w-3.5' />
                      Undang Staf Pertama
                    </Button>
                  )
                }
                className='h-full w-full flex-1'
              />
            </div>
          ) : (
            <div className='absolute inset-0 flex overflow-hidden'>
              <ScrollArea className='h-full w-full pr-0 md:pr-3'>
                <div className='pb-20 pt-1'>
                  <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5'>
                    {filteredStaffs.map((staff) => (
                      <StaffScheduleCard
                        key={staff.id}
                        staff={staff}
                        onOpenRoster={(s) => setSelectedStaffForRoster(s)}
                        onOpenDetail={(s) => setSelectedStaffForDetail(s)}
                      />
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Riwayat Undangan */}
        <TabsContent
          value='invitations'
          className='relative flex flex-1 min-h-0 flex-col overflow-hidden m-0'
        >
          <div className='absolute inset-0 flex overflow-hidden'>
            <ScrollArea className='h-full w-full pr-0 md:pr-3'>
              <div className='pb-20 pt-1'>
                {loading ? (
                  <div className='flex items-center justify-center py-16 text-muted-foreground'>
                    <Icons.spinner className='h-6 w-6 animate-spin mr-2' />
                    Memuat riwayat undangan...
                  </div>
                ) : invitations.length === 0 ? (
                  <EmptyState
                    icon={Icons.mail}
                    title='Belum Ada Riwayat Undangan'
                    description='Seluruh riwayat undangan calon staf via email akan tercatat di sini.'
                  />
                ) : (
                  <div className='rounded-xl border border-border overflow-hidden bg-card'>
                    <Table>
                      <TableHeader className='bg-muted/40'>
                        <TableRow>
                          <TableHead className='font-semibold text-xs'>Email Calon Staf</TableHead>
                          <TableHead className='font-semibold text-xs'>Peran Ditugaskan</TableHead>
                          <TableHead className='font-semibold text-xs'>Status</TableHead>
                          <TableHead className='font-semibold text-xs'>Kedaluwarsa</TableHead>
                          <TableHead className='font-semibold text-xs'>Tanggal Kirim</TableHead>
                          <TableHead className='text-right font-semibold text-xs'>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className='divide-y divide-border/40'>
                        {invitations.map((inv) => (
                          <TableRow key={inv.id} className='hover:bg-muted/20'>
                            <TableCell className='font-medium text-xs'>{inv.email}</TableCell>
                            <TableCell>{renderRoleBadge()}</TableCell>
                            <TableCell>{renderStatusBadge(inv.status)}</TableCell>
                            <TableCell className='text-xs text-muted-foreground font-mono'>
                              {new Date(inv.expiresAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </TableCell>
                            <TableCell className='text-xs text-muted-foreground font-mono'>
                              {new Date(inv.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </TableCell>
                            <TableCell className='text-right'>
                              {inv.status === 'pending' && (
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => handleRevokeInvitation(inv.id, inv.email)}
                                  className='h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10'
                                >
                                  Batalkan
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <InviteStaffModal
        isOpen={isInviteStaffOpen}
        onClose={() => setIsInviteStaffOpen(false)}
        onSuccess={reloadData}
      />

      <StaffRosterModal
        staff={selectedStaffForRoster}
        isOpen={Boolean(selectedStaffForRoster)}
        onClose={() => setSelectedStaffForRoster(null)}
        onSuccess={reloadData}
      />

      <StaffDetailEditModal
        staff={selectedStaffForDetail}
        isOpen={Boolean(selectedStaffForDetail)}
        onClose={() => setSelectedStaffForDetail(null)}
        onSuccess={reloadData}
      />
    </div>
  );
}
