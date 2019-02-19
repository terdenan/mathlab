const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const passport = require('../models/passport');
const upload = require('../models/uploader');

const createUserController = require('../controllers/users/create');
const updateUserController = require('../controllers/users/update');
const getStudentsController = require('../controllers/users/get-students');
const createTeacherController = require('../controllers/users/create-teacher');
const getTeachersController = require('../controllers/users/get-teachers');
const changeAvatarController = require('../controllers/users/change-avatar');
const changePasswordController = require('../controllers/users/change-password');
const sendRecoverLinkController = require('../controllers/users/send-recover-link');
const sendConfirmLinkController = require('../controllers/users/send-confirm-link');
const recoverPasswordController = require('../controllers/users/recover-password');
const getBidsController = require('../controllers/bids/get-bids');
const createBidController = require('../controllers/bids/create');
const updateBidController = require('../controllers/bids/update');
const createCourseController = require('../controllers/courses/create');
const getCoursesController = require('../controllers/courses/get-courses');
const extendCourseController = require('../controllers/courses/extend-course');
const getMessagesController = require('../controllers/messages/get-messages');
const createMessageController = require('../controllers/messages/create');
const deleteMessageController = require('../controllers/messages/delete');
const createCallbackController = require('../controllers/callback-requests/create');
const createNewsController = require('../controllers/news/create');
const updateTeacherInfoController = require('../controllers/teacher-info/update');
const deleteTeacherInfoCertificateController = require('../controllers/teacher-info/delete-certificate');

router.post('/user', asyncHandler(createUserController));
router.put('/profileInfo', passport.auth('user'), asyncHandler(updateUserController));
router.get('/students', passport.auth('admin'), asyncHandler(getStudentsController));
router.post('/teacher', passport.auth('admin'), asyncHandler(createTeacherController));
router.get('/teachers', passport.auth('admin'), asyncHandler(getTeachersController));
router.post('/changeAvatar', passport.auth('user'), upload.single('file'), asyncHandler(changeAvatarController));
router.post('/changePassword', passport.auth('user'), asyncHandler(changePasswordController));
router.post('/recoverPassword', asyncHandler(sendRecoverLinkController));
router.put('/recoverPassword', asyncHandler(recoverPasswordController));
router.post('/sendConfirmationEmail', passport.auth('user'), asyncHandler(sendConfirmLinkController));

router.put('/bid', passport.auth(), asyncHandler(createBidController));
router.get('/bids', passport.auth('admin'), asyncHandler(getBidsController));
router.post('/bid', passport.auth('admin'), asyncHandler(updateBidController));

router.put('/course', passport.auth('admin'), asyncHandler(createCourseController));
router.get('/courses', passport.auth('admin'), asyncHandler(getCoursesController));
router.post('/extendCourse', passport.auth('admin'), asyncHandler(extendCourseController));

router.get('/messages', passport.auth('user'), asyncHandler(getMessagesController));
router.put('/message', passport.auth('user'), upload.single('file'), asyncHandler(createMessageController));
router.delete('/messages/:messageId', passport.auth('user'), asyncHandler(deleteMessageController));

router.post('/callback', asyncHandler(createCallbackController));

router.post('/news', passport.auth('admin'), upload.single('file'), asyncHandler(createNewsController));

router.put('/teacherInfo/:id', passport.auth('admin'), upload.fields([{name: 'certificatesImages', maxCount: 5}, {name: 'avatar', maxCount: 1}]), asyncHandler(updateTeacherInfoController));
router.delete('/teacherInfo/:id/certificate/:certId', passport.auth('admin'), asyncHandler(deleteTeacherInfoCertificateController));

module.exports = router;
