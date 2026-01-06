import { type SVGProps } from 'react';

// 直接使用ES模块import导入SVG组件，由SVGR插件处理
import AlbumFill from '@/assets/icons/album-fill.svg';
import AlipayFill from '@/assets/icons/alipay-fill.svg';
import AnchorLine from '@/assets/icons/anchor-line.svg';
import AppleLine from '@/assets/icons/apple-line.svg';
import BilibiliLine from '@/assets/icons/bilibili-line.svg';
import DiscLine from '@/assets/icons/disc-line.svg';
import ExternalLinkLine from '@/assets/icons/external-link-line.svg';
import FileCopyLine from '@/assets/icons/file-copy-line.svg';
import GithubFill from '@/assets/icons/github-fill.svg';
import Home3Line from '@/assets/icons/home-3-line.svg';
import LinkUnlink from '@/assets/icons/link-unlink.svg';
import LinkSvg from '@/assets/icons/link.svg';
import LinksFill from '@/assets/icons/links-fill.svg';
import Music2Line from '@/assets/icons/music-2-line.svg';
import NeteaseCloudMusicLine from '@/assets/icons/netease-cloud-music-line.svg';
import QqLine from '@/assets/icons/qq-line.svg';
import Search2Line from '@/assets/icons/search-2-line.svg';
import SettingsLine from '@/assets/icons/settings-line.svg';
import SteamFill from '@/assets/icons/steam-fill.svg';
import Wechat2Line from '@/assets/icons/wechat-2-line.svg';
import WechatFill from '@/assets/icons/wechat-fill.svg';
import WeiboLine from '@/assets/icons/weibo-line.svg';
import ZhihuFill from '@/assets/icons/zhihu-fill.svg';

interface LocalIconProps extends SVGProps<SVGSVGElement> {
  name: string;
}

// 扩展图标映射类型，支持React组件和SVG数据URL
const iconMap: Record<string, React.FC<SVGProps<SVGSVGElement>> | string> = {
  'album-fill': AlbumFill,
  'alipay-fill': AlipayFill,
  'anchor-line': AnchorLine,
  'apple-line': AppleLine,
  'bilibili-line': BilibiliLine,
  'disc-line': DiscLine,
  'external-link-line': ExternalLinkLine,
  'file-copy-line': FileCopyLine,
  'github-fill': GithubFill,
  'home-3-line': Home3Line,
  'link-unlink': LinkUnlink,
  'link': LinkSvg,
  'links-fill': LinksFill,
  'music-2-line': Music2Line,
  'netease-cloud-music-line': NeteaseCloudMusicLine,
  'qq-line': QqLine,
  'search-2-line': Search2Line,
  'settings-line': SettingsLine,
  'steam-fill': SteamFill,
  'wechat-2-line': Wechat2Line,
  'wechat-fill': WechatFill,
  'weibo-line': WeiboLine,
  'zhihu-fill': ZhihuFill,
  // 兼容旧图标名称
  'twitter': GithubFill, // 暂时使用github图标替代，用户可以在配置中修改
  'youtube': Music2Line, // 暂时使用music图标替代，用户可以在配置中修改
  'bilibili': BilibiliLine,
  'github': GithubFill,
  'mail': ExternalLinkLine, // 暂时使用external-link图标替代
  'share': LinksFill,
  'phone': ExternalLinkLine, // 暂时使用external-link图标替代
  'mappin': ExternalLinkLine, // 暂时使用external-link图标替代
  'facebook': GithubFill, // 暂时使用github图标替代
  'instagram': GithubFill, // 暂时使用github图标替代
  'linkedin': GithubFill, // 暂时使用github图标替代
  'globe': ExternalLinkLine, // 暂时使用external-link图标替代
};

export function LocalIcon({ name, className, ...props }: LocalIconProps) {
  const iconValue = iconMap[name.toLowerCase()] || ExternalLinkLine;
  
  // 检查图标值是React组件还是SVG数据URL
  if (typeof iconValue === 'string') {
    // 正确模式：如果是数据URL，使用img标签渲染
    return (
      <img 
        src={iconValue} 
        alt={name} 
        className={className} 
        {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} 
      />
    );
  } else {
    // 正确模式：如果是React组件，直接渲染
    const IconComponent = iconValue;
    return <IconComponent className={className} {...props} />;
  }
}
