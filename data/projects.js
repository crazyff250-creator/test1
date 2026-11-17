// All site content that changes lives here.
//
// Add a project: copy one entry below, change the fields, drop the files into assets/.
// The page lays projects out automatically: the first one is the large featured piece,
// the rest follow an asymmetrical rhythm, so any number of projects works.
//
//   title, category, duration   shown under the clip
//   preview  short muted loop (2-4MB) that plays on hover
//   poster   still frame shown before the clip plays
//   full     optional full edit. A video file path/URL, or a YouTube link (https://youtu.be/xxxx).
//            Opens in the player when a tile is clicked.
//            Leave null to play the preview there instead.
//   ratio    optional shape override for a tile, e.g. '16/9', '4/5', '1/1'

export const site = {
  showNames: false, // set to true to show each edit's title, category and length under its clip
  name: 'framedax',
  email: 'framedaxx@gmail.com',
  instagram: 'https://www.instagram.com/framedax_',
  instagramHandle: '@framedax_',
  logo: 'assets/logo.svg',
};

export const projects = [
  {
    id: 'fable-5-1',
    title: 'Fable 5.1',
    category: 'Motion graphics',
    duration: '0:23',
    preview: 'previews/fable-5-1.mp4',
    poster: 'posters/fable-5-1.jpg',
    full: 'fable-5-1.mp4',
  },
  {
    id: 'claude',
    title: 'Claude',
    category: 'Motion graphics',
    duration: '0:10',
    preview: 'previews/claude.mp4',
    poster: 'posters/claude.jpg',
    full: 'claude.mp4',
  },
  {
    id: 'chatgpt',
    title: 'ChatGPT',
    category: 'Motion graphics',
    duration: '0:06',
    preview: 'previews/chatgpt.mp4',
    poster: 'posters/chatgpt.jpg',
    full: 'chatgpt.mp4',
  },
  {
    id: 'discord-ui',
    title: 'Discord UI',
    category: 'Motion graphics',
    duration: '0:20',
    preview: 'previews/discord-ui.mp4',
    poster: 'posters/discord-ui.jpg',
    full: 'discord-ui.mp4',
  },
  {
    id: 'swiggy',
    title: 'Swiggy',
    category: 'Motion graphics',
    duration: '0:06',
    preview: 'previews/swiggy.mp4',
    poster: 'posters/swiggy.jpg',
    full: 'swiggy.mp4',
  },
  {
    id: 'bounce-test',
    title: 'Bounce test',
    category: 'Motion graphics',
    duration: '0:06',
    preview: 'previews/bounce-test.mp4',
    poster: 'posters/bounce-test.jpg',
    full: 'bounce-test.mp4',
  },
];
