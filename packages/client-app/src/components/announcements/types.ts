export interface AnnouncementData {
  id: string;
  title: string;
  expiry: string; // Date string
  linkTo: string;
  description: string;
  publicationDate: string; // Date string
  isRead: boolean;
}

export interface ProcessedAnnouncement extends AnnouncementData {
  iconType: "star" | "newspaper";
  plainTitle: string;
}

export interface AnnouncementListItemProps {
  announcement: ProcessedAnnouncement;
}

export interface AnnouncementCardProps {
  announcement: ProcessedAnnouncement;
}
