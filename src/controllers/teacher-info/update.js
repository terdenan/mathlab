const ObjectId = require('mongodb').ObjectID;

module.exports = async (req, res) => {
    console.log(req.url);
    console.log(req.body);
    console.log(req.file);
    // const teacher_id = req.params.id;
    // if (!ObjectId.isValid(teacher_id)) {
    //     res.status(400);
    //     res.send(`ObejctId '${teacher_id}' is not valid`);
    //     return;
    // }
    // const teacher = await req.userModel.getBy({_id: ObjectId(teacher_id)});
    // if (!teacher) {
    //     res.status(404);
    //     res.send(`There is no teacher mathcing id '${teacher_id}'`);
    //     return;
    // }

    // const profileInfo = await req.teacherInfo.getBy({_teacher_id: ObjectId(teacher_id)});
    // if (!profileInfo) {
    //     await req.teacherInfo.create({_teacher_id: teacher_id});
    // }

    //const fields = req.body4
    //console.log(req.body);
    // const bidId = ObjectId(req.body.id);
    // const fields = req.body.fields;
    // await req.bidModel.update({_id: bidId}, fields);
    // res.status(200);
    // res.send('success');
}