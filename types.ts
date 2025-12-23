export type Language = 'tl' | 'en';

export interface Translation {
  nav: {
    home: string;
    about: string;
    devotionals: string;
    joinLive: string;
    getInvolved: string;
  };
  home: {
    hero: {
      title: string;
      subtitle: string;
      ctaJoin: string;
      ctaWatch: string;
    };
    started: {
      title: string;
      body: string;
    };
    whatWeDo: {
      title: string;
      daily: string;
      dailyDesc: string;
      ledBy: string;
      ledByDesc: string;
      accessible: string;
      accessibleDesc: string;
    };
    scripture: {
      text: string;
      ref: string;
    };
  };
  about: {
    title: string;
    intro: string;
    missionTitle: string;
    mission: string;
    visionTitle: string;
    vision: string;
  };
  devotionals: {
    title: string;
    intro: string;
    filterAll: string;
    filterEn: string;
    filterTl: string;
    searchPlaceholder: string;
    watchBtn: string;
  };
  joinLive: {
    title: string;
    intro: string;
    platform: string;
    language: string;
    schedule: string;
    btn: string;
  };
  getInvolved: {
    title: string;
    lead: string;
    leadDesc: string;
    help: string;
    helpDesc: string;
    connect: string;
    connectDesc: string;
  };
  footer: {
    copyright: string;
  };
}

export interface Devotional {
  id: string;
  date: string;
  title: string;
  speaker: string;
  language: Language;
  scripture: string;
  videoUrl: string; // Could be YouTube ID or URL
  thumbnailUrl: string;
}
