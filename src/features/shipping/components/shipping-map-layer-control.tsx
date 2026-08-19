'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { SHIPPING_TILE_LAYERS, type ShippingTileLayerId } from '../constants/map';

interface ShippingMapLayerControlProps {
  tileLayerId: ShippingTileLayerId;
  onTileLayerChange: (layerId: ShippingTileLayerId) => void;
  className?: string;
  triggerClassName?: string;
  label?: string;
  showLabel?: boolean;
}

export function ShippingMapLayerControl({
  tileLayerId,
  onTileLayerChange,
  className,
  triggerClassName,
  label,
  showLabel = true
}: ShippingMapLayerControlProps) {
  const selectedLayer = SHIPPING_TILE_LAYERS[tileLayerId];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size='sm'
          aria-label='Change map layer'
          className={cn('bg-background/80', triggerClassName, className)}
        >
          <ShippingLayerPreview layerId={tileLayerId} className='size-5' />
          {showLabel ? <span className='truncate'>{label ?? selectedLayer.label}</span> : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-72'>
        <DropdownMenuLabel>Base layer</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={tileLayerId}
          onValueChange={(value) => onTileLayerChange(value as ShippingTileLayerId)}
        >
          {(
            Object.entries(SHIPPING_TILE_LAYERS) as Array<
              [ShippingTileLayerId, (typeof SHIPPING_TILE_LAYERS)[ShippingTileLayerId]]
            >
          ).map(([layerId, layer]) => (
            <DropdownMenuRadioItem key={layerId} value={layerId}>
              <span className='flex min-w-0 items-center gap-3'>
                <ShippingLayerPreview layerId={layerId} className='size-10 shrink-0' />
                <span className='grid min-w-0 gap-0.5'>
                  <span className='truncate'>{layer.label}</span>
                  <span className='truncate text-xs text-muted-foreground'>
                    {layer.description}
                  </span>
                </span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ShippingLayerPreview({
  layerId,
  className
}: {
  layerId: ShippingTileLayerId;
  className?: string;
}) {
  const Icon = getLayerPreviewIcon(layerId);

  return (
    <span
      className={cn(
        'shipping-map-layer-preview grid place-items-center overflow-hidden rounded-md border shadow-xs',
        `shipping-map-layer-preview-${layerId}`,
        className
      )}
    >
      <Icon className='relative z-10 size-4' />
    </span>
  );
}

function getLayerPreviewIcon(layerId: ShippingTileLayerId) {
  const icons: Record<ShippingTileLayerId, typeof Icons.map> = {
    midnight: Icons.moon,
    daylight: Icons.sun,
    satellite: Icons.radar,
    terrain: Icons.map
  };

  return icons[layerId];
}
