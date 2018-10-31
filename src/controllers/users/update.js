const ObjectId = require('mongodb').ObjectID;

const possible_fields = {
    'fullname': 'string',
    'phone': 'string',
    'grade': 'string',
}

module.exports = async (req, res) => {
    const fields = {};
    let isDataValid = true;

    Reflect.ownKeys(req.body).forEach(key => {
        if (possible_fields.hasOwnProperty(key) && typeof(req.body[key]) === possible_fields[key]) {
            fields[key] = req.body[key];
        } else {
            isDataValid = false;
        }
    });
    if (!isDataValid) {
        res.status(400);
        res.send('Bad request format');
        return;
    }

    await req.userModel.update(req.user._id, fields);
    if (fields.fullname) {
        if (req.user.priority == 0) {
            await req.courseModel.updateMany(
                {_student_id: req.user._id},
                { student: fields.fullname}
            );
        }
        else {
            await req.courseModel.updateMany(
                {_teacher_id: req.user._id},
                { teacher: fields.fullname}
            );
        }
    }
    res.send('success');
}