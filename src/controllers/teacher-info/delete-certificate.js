const fs = require('fs');
const ObjectId = require('mongodb').ObjectID;
const path = require('path');

module.exports = async (req, res) => {
    const teacher_id = req.params.id;
    const cert_id = req.params.certId;
    if (!ObjectId.isValid(teacher_id) || !ObjectId.isValid(cert_id)) {
        res.status(400);
        res.send(`ObejctId '${teacher_id}' or '${cert_id}' is not valid`);
        return;
    }
    const teacher = await req.userModel.getBy({_id: ObjectId(teacher_id)});
    if (!teacher) {
        res.status(404);
        res.send(`There is no teacher mathcing id '${teacher_id}'`);
        return;
    }

    const teacherInfo = await req.teacherInfo.deleteCertificate(
        { teacher: ObjectId(teacher_id) },
        ObjectId(cert_id)
    );
    const certIndex = teacherInfo.certificates.findIndex(item => item._id == cert_id);
    const deletedCertificatePath = path.join(process.cwd(), '/static/public', teacherInfo.certificates[certIndex].url);
    
    fs.unlink(deletedCertificatePath, (err) => {
        if (err && err.code !== 'ENOENT') throw err;
        res.status(200);
        res.send('success');
    });
}
