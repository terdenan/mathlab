const isProduction = process.env.NODE_ENV === 'production';

const USER_TYPE_BY_PRIOIRITY = {
    0: 'student',
    1: 'teacher',
    2: 'admin',
};

const SEX_BY_LITERAL = {
    0: 'male',
    1: 'female',
}

function getUserCohort(registrationDate) {
	if (!registrationDate) {
		return [null, null, null];
	}

	const [year, month, date] = [registrationDate.getFullYear(), registrationDate.getMonth(), registrationDate.getDate()];
	const baseDate = new Date(Date.UTC(year, month, date));
	const yearStart = new Date(Date.UTC(baseDate.getFullYear(), 0, 1));
	// "|| 7" из-за того, что 0 соответствует воскресенью
	const dayNum = baseDate.getUTCDay() || 7;

	const diff = (registrationDate - yearStart) / (24 * 60 * 60 * 1000);
	const daysPassed = Math.ceil(diff);
	const weeksPassed = Math.ceil((diff + 1) / 7);

	return [daysPassed, weeksPassed, baseDate.getMonth() + 1];
}

function setUserProperties(req, res, next) {
	// Выставляем только авторизованным пользователям
	if (!req.user) {
        next();

        return;
    }

    if (!req.cookies['user_properties']) {
    	const [cohort_day, cohort_week, cohort_month] = getUserCohort(req.user.registrationDate);
        const userProperties = {
            email: req.user.email,
            user_type: USER_TYPE_BY_PRIOIRITY[req.user.priority],
            user_sex: SEX_BY_LITERAL[req.user.sex],
            user_school_grade: req.user.priority === 1 ? -1 : req.user.grade,
            cohort_day,
            cohort_week,
            cohort_month,
        };
        const cookieValue = JSON.stringify(userProperties);
        const cookieExpiration = Date.now() + 365 * 24 * 60 * 60 * 1000;

        res.cookie('user_properties', cookieValue, {
            expires: new Date(cookieExpiration),
            secure: isProduction,
        });
    }

    next();
}

module.exports = {
	setUserProperties,
};