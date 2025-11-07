import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  MenuContent,
  MenuItem,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu"
import { authClient } from "@/lib/auth"
import { getAvatarUrl } from "@/lib/avatar"
import {
  ArrowRightStartOnRectangleIcon,
  Cog6ToothIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline"

export function UserMenu() {
  const { data: session } = authClient.useSession()

  if (!session?.user) {
    return null
  }

  const user = session.user

  return (
    <MenuTrigger>
      <Button
        intent="plain"
        size="sm"
        className="gap-2 px-2 py-1.5 data-[hovered]:bg-secondary data-[pressed]:bg-secondary"
      >
        <Avatar alt={user.name} size="sm" isSquare={false} src={getAvatarUrl(user)} />
        <span className="sr-only sm:not-sr-only sm:ml-2">{user.name}</span>
      </Button>
      <MenuContent placement="bottom end" className="min-w-[200px]">
        <MenuSection>
          <MenuItem href="/dashboard">
            <Cog6ToothIcon />
            Dashboard
          </MenuItem>
          <MenuItem href="/settings/profile">
            <UserCircleIcon />
            Edit Profile
          </MenuItem>
        </MenuSection>
        <MenuSeparator />
        <MenuSection>
          <MenuItem onAction={() => authClient.signOut()}>
            <ArrowRightStartOnRectangleIcon />
            Sign Out
          </MenuItem>
        </MenuSection>
      </MenuContent>
    </MenuTrigger>
  )
}
