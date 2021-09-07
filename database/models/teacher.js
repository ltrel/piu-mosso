module.exports.define = (sequelize) => {
  sequelize.define('Teacher', {});
};

module.exports.addAssociations = ({models}) => {
  models.Teacher.hasMany(models.Location);
  models.Location.belongsTo(models.Teacher);

  models.Teacher.belongsToMany(models.Student, {through: 'TeacherStudents'});
  models.Student.belongsToMany(models.Teacher, {through: 'TeacherStudents'});
};
