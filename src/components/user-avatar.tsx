import { Avatar } from '@/components/avatar';
import { getProfile } from '@/lib/data/store';

/**
 * Avatar de un usuario por id: toma `avatar_icon` del perfil cargado
 * (id desconocido -> silueta). Foto (`avatar_path`) aún no se firma en el
 * panel; cuando exista URL, pásala como `photoUrl`.
 */
export const UserIcon = ({
  userId,
  size,
  decorative,
  bg,
}: {
  userId: string;
  size?: number;
  decorative?: boolean;
  bg?: 'tint' | 'bold';
}) => (
  <Avatar
    avatarId={getProfile(userId)?.avatar_icon}
    size={size}
    decorative={decorative}
    bg={bg}
  />
);
