import {Component} from "solid-js";

import {ToastiDragGhost} from "./components/DragGhost";
import {Header} from "./components/Header";
import {Iron} from "./components/iron/Iron";
import {ironWidthClass} from "./components/iron/ironLayout";
import {AdBreak} from "./components/modals/AdBreak";
import {ConfigModal} from "./components/modals/ConfigModal";
import {GrillModal} from "./components/modals/GrillModal";
import {PeopleModal} from "./components/modals/PeopleModal";
import {Scoreboard} from "./components/modals/Scoreboard";
import {Plate} from "./components/Plate";
import {Queue} from "./components/Queue";
import {Roster} from "./components/Roster";
import {Toast} from "./components/Toast";
import {ToastieFacts} from "./components/ToastieFacts";
import {ironSlots} from "./store/store";

const App: Component = () => (
  <div class="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#fff9ec,#f6e6c8)] text-amber-950 lg:h-screen lg:overflow-hidden">
    <Header />

    <main
      class={`grid min-h-0 flex-1 gap-4 px-3 pb-4 sm:gap-5 sm:px-5 sm:pb-5 ${ironWidthClass(ironSlots())}`}
    >
      <div class="flex min-h-0 flex-col">
        <Iron />
        <ToastieFacts />
      </div>
      <aside class="flex min-h-0 flex-col gap-4">
        <Roster />
        <Plate />
        <Queue />
      </aside>
    </main>

    <ToastiDragGhost />
    <AdBreak />
    <ConfigModal />
    <PeopleModal />
    <GrillModal />
    <Scoreboard />
    <Toast />
  </div>
);

export default App;
