class Call {
  constructor(id, userId, startTime) {
    this.id = id;
    this.userId = userId;
    this.startTime = startTime;
    this.endTime = null;
    this.status = 'active';
  }

  endCall() {
    this.endTime = new Date();
    this.status = 'ended';
  }
}

module.exports = Call;