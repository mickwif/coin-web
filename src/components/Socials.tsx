import { DISCORD_URL, TWITTER_URL } from '@/utils/constants';
import Image from 'next/image';
import Link from 'next/link';
import Bird from '../../public/bird.png';

const IconWrapper = ({
  children,
  className,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href: string;
}) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    <div
      className={`w-5 h-5 relative flex items-center justify-center ${className}`}
    >
      {children}
    </div>
  </a>
);

export const Socials = () => {
  return (
    <div className="flex items-center gap-10">
      <IconWrapper href="https://yeezy.com">
        <img width={20} height={20} src={'/yeezy.svg'} />
      </IconWrapper>
      <IconWrapper href="https://t.me/YZY_MNY">
        <img width={20} height={20} src={'/telegram.svg'} />
      </IconWrapper>
      <IconWrapper href="https://x.com/yzy_mny">
        <img width={20} height={20} src={'/x-icon.svg'} />
      </IconWrapper>
      <IconWrapper href="https://instagram.com/yzy.mny">
        <img width={20} height={20} src={'/ig2.png'} />
      </IconWrapper>
      <IconWrapper href="https://www.tiktok.com/@yzy.mny">
        <img width={20} height={20} src={'/tiktok.png'} />
      </IconWrapper>
    </div>
  );
};
