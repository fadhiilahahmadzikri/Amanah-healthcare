$envs = @{
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" = "pk_test_aGVscGluZy1odXNreS02NS5jbGVyay5hY2NvdW50cy5kZXYk"
    "CLERK_SECRET_KEY" = "sk_test_UPg5CBLClgYnQxoMUrpsO24E7FdmwUz3vWy3apkWUe"
    "NEXT_PUBLIC_CLERK_SIGN_IN_URL" = "/auth/sign-in"
    "NEXT_PUBLIC_CLERK_SIGN_UP_URL" = "/auth/sign-up"
    "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL" = "/dashboard/overview"
    "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL" = "/dashboard/overview"
}

foreach ($key in $envs.Keys) {
    [System.IO.File]::WriteAllText("temp_env.txt", $envs[$key])
    Get-Content -Raw "temp_env.txt" | vercel env add $key production
}
Remove-Item "temp_env.txt"
