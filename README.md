ouick web app scribble
=======================
This is an application to store and manage datasets within tables.

You can create forms to fill in these datasets and have multiple field types like dropdowns, images, documents etc.


Dependencies
------------
PHP >= 5.6
mySQL


Install
--------
Clone the repo into your apache folder.
Create a mysql database and import the ouick_two.sql
Change the mysql connection details in the inc/class_db.php


Milestones
----------

	Type image and files

	Event triggers (row created, updated etc)

		Send Mail

	
	Generate Form
		Parse Form To HTML
		Api for request

Adding Type
------------

Templating
	needed vars
	%field_id%
	%field_value%
	%ng%
	examples
	'<input type="text" name="%field_id%" id="%field_id%" value="%field_id%" %ng%>';
	'<input type="checkbox" name="%field_id%" id="%field_id%" value="true" %ng%>';
