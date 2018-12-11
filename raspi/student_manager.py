import shelve

my_students = shelve.open('students')

my_students['903666100'] = 'George P. Burdell'

my_students.close()
