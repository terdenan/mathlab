const ObjectId = require('mongodb').ObjectID;

const translitirate = require('../../utils/transliterate');

async function getById(req, res, next) {
	const id = req.params.id;

	if (!ObjectId.isValid(id)) {
       	next();

        return;
    }

    const teacherInfo = await req.teacherInfo.getWithPopulationBy({ teacher: ObjectId(id) }, ['teacher']);

    if (!teacherInfo) {
        next();

        return;
    }

    const teacher = teacherInfo.teacher;
    let transliterated_fullname = teacherInfo.transliterated_fullname;

    if (!transliterated_fullname) {
    	transliterated_fullname = translitirate(teacher.fullname);

        const regExpObj = new RegExp(`^${transliterated_fullname}(-\\d+)?$`);
        const similarTeachers = await req.teacherInfo.new_getMany({ transliterated_fullname: regExpObj });
        
        // Если вдруг нашлись преподаватели с одинаковым transliterated_fullname
        if (similarTeachers.length) {
            transliterated_fullname += `-${similarTeachers.length}`
        }

    	await req.teacherInfo.update({ teacher: id }, { transliterated_fullname });
    }

    res.redirect(301, `/teacher/${transliterated_fullname}`);
}

async function getByTransliteratedFullname(req, res, next) {
	const transliterated_fullname = req.params.transliterated_fullname;
	const data = await req.teacherInfo.getWithPopulationBy({ transliterated_fullname }, ['teacher']);

	if (!data) {
		res.status(404);
        res.render('main/404')

        return;
	}

	const { teacher, ...teacherInfo } = data;

	res.render('main/teacher', {
		teacher,
		profileInfo: teacherInfo,
	});
}

module.exports = {
	getById,
	getByTransliteratedFullname,
}
