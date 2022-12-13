import id from "./id";
import { Player } from "./types";

export default class ComputerPlayer {
  
  getPlayer(): Player {
    return {
      type: 'computer',
      id: id(),
      name: 'Computer',
    };
  }

  doTurn() {
    console.log('do turn');
  }
}