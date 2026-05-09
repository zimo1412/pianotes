import PianoApp from './PianoApp.jsx';
import { LocaleProvider } from './locales/I18nProvider.jsx';

/** SPA bootstrap; persistence in `./storage.js`, strings in `./locales/`. */
export default function App() {
  return (
    <LocaleProvider>
      <PianoApp />
    </LocaleProvider>
  );
}
