// HTML5 video tracking.
//
// GA4's enhanced measurement only tracks embedded YouTube players, so a
// self-hosted <video> needs its events pushed by hand. Names follow GA4's
// video events so GTM triggers look the same as for YouTube:
//   dataLayer: video_start, video_progress (10/25/50/75/90), video_complete,
//              plus custom video_pause and video_seek
// Adobe gets matching events with a media object:
//   adobeDataLayer: media start, media milestone, media complete,
//                   media pause, media seek
import { ga4, adobe } from './lab';

const MILESTONES = [10, 25, 50, 75, 90];

export function trackVideo(video: HTMLVideoElement) {
  const meta = {
    id: video.dataset.videoId ?? video.currentSrc,
    title: video.dataset.videoTitle ?? document.title,
    url: video.currentSrc || video.src,
  };
  const fired = new Set<number>();
  let started = false;
  let completed = false;
  let seeking = false;

  const ga4Base = () => ({
    video_provider: 'html5',
    video_title: meta.title,
    video_url: meta.url,
    video_duration: Math.round(video.duration || 0),
    video_current_time: Math.round(video.currentTime),
    video_percent: video.duration ? Math.round((video.currentTime / video.duration) * 100) : 0,
  });
  const adobeMedia = (extra: Record<string, unknown> = {}) => ({
    media: {
      id: meta.id, name: meta.title, player: 'html5', streamType: 'video',
      length: Math.round(video.duration || 0), playhead: Math.round(video.currentTime), ...extra,
    },
  });

  video.addEventListener('play', () => {
    if (!started) {
      started = true;
      ga4({ event: 'video_start', ...ga4Base() });
      adobe({ event: 'media start', ...adobeMedia() });
    }
  });

  video.addEventListener('timeupdate', () => {
    if (!video.duration || seeking) return;
    const pct = (video.currentTime / video.duration) * 100;
    for (const m of MILESTONES) {
      if (pct >= m && !fired.has(m)) {
        fired.add(m);
        ga4({ event: 'video_progress', ...ga4Base(), video_percent: m });
        adobe({ event: 'media milestone', ...adobeMedia({ milestone: m }) });
      }
    }
  });

  video.addEventListener('pause', () => {
    // Browsers fire 'pause' right before 'ended'; skip that one.
    if (video.ended || !started) return;
    ga4({ event: 'video_pause', ...ga4Base() });
    adobe({ event: 'media pause', ...adobeMedia() });
  });

  video.addEventListener('seeking', () => { seeking = true; });
  video.addEventListener('seeked', () => {
    seeking = false;
    if (!started) return;
    ga4({ event: 'video_seek', ...ga4Base() });
    adobe({ event: 'media seek', ...adobeMedia() });
  });

  video.addEventListener('ended', () => {
    if (completed) return;
    completed = true;
    ga4({ event: 'video_complete', ...ga4Base(), video_percent: 100 });
    adobe({ event: 'media complete', ...adobeMedia() });
  });
}
