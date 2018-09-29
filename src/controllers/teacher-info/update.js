const ObjectId = require('mongodb').ObjectID;

module.exports = async (req, res) => {
    const teacher_id = req.params.id;
    if (!ObjectId.isValid(teacher_id)) {
        res.status(400);
        res.send(`ObejctId '${teacher_id}' is not valid`);
        return;
    }
    const teacher = await req.userModel.getBy({_id: ObjectId(teacher_id)});
    if (!teacher) {
        res.status(404);
        res.send(`There is no teacher mathcing id '${teacher_id}'`);
        return;
    }

    const profileInfo = await req.teacherInfo.getBy({_teacher_id: ObjectId(teacher_id)});
    if (!profileInfo) {
        await req.teacherInfo.create({_teacher_id: teacher_id});
    }

    const isDataValid = req.body
            && Object.prototype.hasOwnProperty.call(req.body, 'geoposition')
            && typeof(req.body.geoposition) === 'string'
            && Object.prototype.hasOwnProperty.call(req.body, 'school')
            && typeof(req.body.school) === 'string'
            && Object.prototype.hasOwnProperty.call(req.body, 'bio')
            && typeof(req.body.bio) === 'string'
            && Object.prototype.hasOwnProperty.call(req.body, 'about')
            && typeof(req.body.about) === 'string';
            // && Object.prototype.hasOwnProperty.call(req.body, 'certificatesNames')
            // && Array.isArray(req.body.certificatesNames);
    if (!isDataValid) {
        res.status(400);
        res.send('User data is invalid');
        return;
    }

    const fields = {
        geoposition: req.body.geoposition,
        school: req.body.school,
        bio: req.body.bio,
        about: req.body.about,
    };
    
    if (req.files.avatar) {
        fields['photo_url'] = `/uploads/${req.files.avatar[0].filename}`;
    }
    if (req.files.certificates && req.body.certificatesNames) {
        fields['certificates'] = [];
        req.files.certificates.forEach((item, i) => {
            fields['certificates'].push({
                title: req.body.certificatesNames[i],
                url: `/uploads/${item.filename}`,
            });
        });
    }
    
    await req.teacherInfo.update({_teacher_id: teacher_id}, fields);
    res.status(200);
    res.send('success');
}