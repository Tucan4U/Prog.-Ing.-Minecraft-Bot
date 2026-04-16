class StateMachine {
  constructor(initialState) {
    this.state = initialState;
  }

  setState(newState) {
    if (this.state === newState) return;

    console.log(`[FSM] ${this.state} → ${newState}`);
    this.state = newState;
  }

  getState() {
    return this.state;
  }
}

module.exports = StateMachine;