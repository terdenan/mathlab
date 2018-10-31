module.exports = async (req, res) => {
    const imagePath = '/uploads/' + req.file.filename;
    await req.userModel.update(req.user._id, {avatarUrl: imagePath});

    if (req.user.priority == 0) {
        await req.courseModel.updateMany(
            {_student_id: req.user._id},
            { studentAvatarUrl: imagePath}
        );
    }
    else {
        await req.courseModel.updateMany(
            {_teacher_id: req.user._id},
            { teacherAvatarUrl: imagePath}
        );
    }

    res.send('success')
}