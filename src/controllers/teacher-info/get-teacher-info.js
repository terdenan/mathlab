const ObjectId = require('mongodb').ObjectID;

const translitirate = require('../../utils/transliterate');

async function getById(req, res, next) {
	const id = req.params.id;

	if (!ObjectId.isValid(id)) {
       	next();

        return;
    }

    const teacherInfo = await req.teacherInfo.getWithPopulationBy({ _teacher_id: ObjectId(id) }, ['_teacher_id']);

    if (!teacherInfo) {
        next();

        return;
    }

    // TODO: переименовать поле _teacher_id
    const teacher = teacherInfo._teacher_id;
    let transliterated_fullname = teacherInfo.transliterated_fullname;

    if (!transliterated_fullname) {
    	transliterated_fullname = translitirate(teacher.fullname);

        const regExpObj = new RegExp(`^${transliterated_fullname}(-\\d+)?$`);
        const similarTeachers = await req.teacherInfo.new_getMany({ transliterated_fullname: regExpObj });
        
        // Если вдруг нашлись преподаватели с одинаковым transliterated_fullname
        if (similarTeachers.length) {
            transliterated_fullname += `-${similarTeachers.length}`
        }

    	await req.teacherInfo.update({ _teacher_id: id }, { transliterated_fullname });
    }

    res.redirect(`/teacher/${transliterated_fullname}`);
}

async function getByTransliteratedFullname(req, res, next) {
	const transliterated_fullname = req.params.transliterated_fullname;
	const data = await req.teacherInfo.getWithPopulationBy({ transliterated_fullname }, ['_teacher_id']);

	if (!data) {
		res.status(404);
        res.render('main/404')

        return;
	}

	const { _teacher_id, ...teacherInfo } = data;

	res.render('main/teacher', {
		teacher: _teacher_id,
		profileInfo: teacherInfo,
	});
}

module.exports = {
	getById,
	getByTransliteratedFullname,
}
