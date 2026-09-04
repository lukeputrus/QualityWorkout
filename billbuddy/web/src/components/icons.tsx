import type { SVGProps } from "react";

// Small hand-rolled icon set (stroke-based, 24x24) so the app doesn't need
// an icon-library dependency for a couple dozen glyphs.
function Icon(props: SVGProps<SVGSVGElement> & { d: string }) {
  const { d, ...rest } = props;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <path d={d} />
    </svg>
  );
}

export const HomeIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p} d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />;
export const ClockIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p} d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3.5 2" />;
export const BriefcaseIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p} d="M3 8h18v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8ZM8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
);
export const UsersIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p} d="M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM17.5 13.5A3 3 0 0 0 19 8M20.5 20v-1a3.5 3.5 0 0 0-2-3.16" />
);
export const ReceiptIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p} d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5V3ZM9 8h6M9 12h6M9 16h4" />
);
export const LandmarkIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p} d="M3 21h18M4 21V10M20 21V10M2 10l10-6 10 6M6 10v11M18 10v11M10 10v11M14 10v11" />
);
export const ChartIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p} d="M4 20V10M10 20V4M16 20v-7M22 20H2" />;
export const CalendarIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p} d="M4 6h16v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6ZM4 10h16M8 3v5M16 3v5" />
);
export const CheckSquareIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p} d="M9 12l2 2 4-4M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
);
export const SettingsIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon
    {...p}
    d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
  />
);
export const MenuIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p} d="M4 6h16M4 12h16M4 18h16" />;
export const XIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p} d="M18 6 6 18M6 6l12 12" />;
export const PlayIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p} d="M6 4.5v15l14-7.5-14-7.5Z" />;
export const PauseIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p} d="M7 4h3v16H7zM14 4h3v16h-3z" />;
export const StopIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p} d="M5 5h14v14H5z" />;
export const TrashIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p} d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6" />;
export const PlusIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p} d="M12 5v14M5 12h14" />;
export const DownloadIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p} d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />;
export const SmartphoneIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p} d="M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM11 18h2" />
);
export const LogOutIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p} d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4M16 17l5-5-5-5M21 12H9" />
);
export const SearchIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p} d="m21 21-4.3-4.3M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />;
