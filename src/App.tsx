import {Component} from "solid-js";

import {ConfigModal} from "./components/ConfigModal";
import {DragGhost} from "./components/DragGhost";
import {Header} from "./components/Header";
import {Iron} from "./components/Iron";
import {PeopleModal} from "./components/PeopleModal";
import {Plate} from "./components/Plate";
import {Queue} from "./components/Queue";
import {Roster} from "./components/Roster";
import {Scoreboard} from "./components/Scoreboard";
import {Toast} from "./components/Toast";

const App: Component = () => (
  <div class="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#fff9ec,#f6e6c8)] text-amber-950 lg:h-screen lg:overflow-hidden">
    <Header />

    <main class="grid min-h-0 flex-1 gap-4 px-3 pb-4 sm:gap-5 sm:px-5 sm:pb-5 lg:grid-cols-[minmax(0,44rem)_minmax(0,1fr)]">
      <Iron />
      <aside class="flex min-h-0 flex-col gap-4">
        <Roster />
        <Plate />
        <Queue />
      </aside>
    </main>

    <DragGhost />
    <ConfigModal />
    <PeopleModal />
    <Scoreboard />
    <Toast />
  </div>
);

export default App;
