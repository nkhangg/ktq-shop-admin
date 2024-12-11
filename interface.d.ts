interface ITimestamp {
    created_at: string;
    updated_at: string;
}

interface IUser extends ITimestamp {
    id: number;
    email: string;
    username: string;
    first_name: null | string;
    last_name: null | string;
}

interface INavbarItemData {
    label: string;
    icon: React.FC<any>;
    initiallyOpened?: boolean;
    link?: string;
    links?: { label: string; link: string }[];
}
