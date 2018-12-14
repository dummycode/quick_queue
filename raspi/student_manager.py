import shelve

my_students = shelve.open('students')

my_students['903189059'] = 'George P. Burdell'
my_students['903264209'] = 'Ellie Johnson'

my_students.close()
