const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Course = require('../models/Course')
const Bootcamp = require('../models/Bootcamp')
const advancedResults = require('../middleware/advancedResults')

// @desc    Get Courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public 
exports.getCourses = asyncHandler(async(req, res, next) => {   

    if(req.params.bootcampId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampId })
        
        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    } else {
        res.status(200).json(res.advancedResults)
    }
})
    

// @desc    Get Course
// @route   GET /api/v1/courses/:id
// @access  Public 
exports.getCourse = asyncHandler(async(req, res, next) => {
    
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    })
    
    if(!course) {
        return next(new ErrorResponse(`No course found by id ${req.params.id}`), 404)
    }

    res.status(200).json({
        success: true,
        data: course  
    })
})

// @desc    Add Course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private 
exports.addCourse = asyncHandler( async(req, res, next) => {

    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if(!bootcamp) {
        new ErrorResponse(`No bootcamp with id ${req.params.bootcampId}`), 404
    }

    // Make sure user is bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a course for the bootcamp ${bootcamp._id}`))
    }
    
    const course = await Course.create(req.body)

    res.status(200).json({
        success: true,
        data: course  
    })
})


// @desc    Update Course
// @route   PUT /api/v1/courses/:id
// @access  Private 
exports.updateCourse = asyncHandler( async(req, res, next) => {
    
    let course = await Course.findById(req.params.id)

    
    if(!course) {
        return (new ErrorResponse(`No course found by id ${req.params.id}`), 404)
    }

    // Verify the user is course owner
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorised to update course ${course._id}`))
    }
    
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })     

    res.status(200).json({
        success: true,
        data: course  
    })
})



// @desc    Delete Course
// @route   DELETE /api/v1/courses/:id
// @access  Private 
exports.deleteCourse = asyncHandler( async(req, res, next) => {
    
    const course = await Course.findById(req.params.id)
    
    if(!course) {
        return (new ErrorResponse(`No course found by id ${req.params.id}`), 404)
    }
    
    // Verify user is course owner
    if(course.user !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete course ${course._id}`))
    }
    course.remove(req.params.id)

    res.status(200).json({
        success: true,
        data: {}  
    })
})