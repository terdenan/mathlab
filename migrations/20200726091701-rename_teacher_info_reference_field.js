module.exports = {
  async up(db, client) {
    const session = client.startSession();
    
    try {
      await session.withTransaction(async () => {
        const teacherInfoCollection = db.collection('teacherinfos');

        teacherInfoCollection.updateMany({}, { $rename: { '_teacher_id': 'teacher' } });
      });
    } finally {
      await session.endSession();
    }
  },

  async down(db, client) {
    const session = client.startSession();
    
    try {
      await session.withTransaction(async () => {
        const teacherInfoCollection = db.collection('teacherinfos');

        teacherInfoCollection.updateMany({}, { $rename: { 'teacher': '_teacher_id' } });
      });
    } finally {
      await session.endSession();
    }
  }
};
