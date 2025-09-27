import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import AssignmentIcon from '@mui/icons-material/Assignment';

type AvatarAdminProps = {
    imageUrl?: string;
    name?: string;
    variant?: 'square' | 'rounded' | 'circular';
    size?: number;
    icon?: React.ReactNode;
};

export default function AvatarLogo({
                                       imageUrl,
                                       name,
                                       variant = 'square',
                                       size = 32,
                                       icon,
                                   }: AvatarAdminProps) {
    return (
        <Stack direction="row" spacing={2}>
            <Avatar
                src={imageUrl}
                variant={variant}
                sx={{
                    width: size,
                    height: size,
                    bgcolor: !imageUrl ? '#ff7043' : undefined,
                    fontWeight: 600,
                    fontSize: 30,
                }}
            >
                {imageUrl
                    ? null
                    : icon
                        ? icon
                        : name
                            ? name.charAt(0).toUpperCase()
                            : <AssignmentIcon />}
            </Avatar>
        </Stack>
    );
}


// // Hiển thị avatar hình vuông với ảnh
// <AvatarAdmin imageUrl="https://randomuser.me/api/portraits/men/1.jpg" variant="square" />

// // Hiển thị avatar hình tròn với chữ cái đầu tên
// <AvatarAdmin name="Nguyen Van A" variant="circular" />

// // Hiển thị avatar bo góc với icon
// <AvatarAdmin variant="rounded" icon={<AssignmentIcon />} />