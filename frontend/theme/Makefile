#
# Specialized Makefile to build Bootstrap with custom LESS overrides in ./less
#

THEME_TARGET_DIR = ../public

BOOTSTRAP_SOURCE_DIR = ./bootstrap

BOOTSTRAP_LESS = ${BOOTSTRAP_SOURCE_DIR}/less/bootstrap.less
BOOTSTRAP_RESPONSIVE_LESS = ${BOOTSTRAP_SOURCE_DIR}/less/responsive.less
JASNY_BOOTSTRAP_LESS = ${BOOTSTRAP_SOURCE_DIR}/less/jasny-bootstrap.less
JASNY_BOOTSTRAP_RESPONSIVE_LESS = ${BOOTSTRAP_SOURCE_DIR}/less/jasny-responsive.less

BOOTSTRAP_JS_TARGET_DIR = ${THEME_TARGET_DIR}/js/libs/bootstrap

THEME_LESS_SOURCE_DIR = ./less
THEME_LESS = ${THEME_LESS_SOURCE_DIR}/theme.less

DATE=$(shell date +%I:%M%p)
NODE_BIN_DIR = ../../node_modules/.bin

GIT_IGNORE = "*\n!.gitignore"

all: theme

#
# CLEANS PRIOR BUILDS
#

clean:
	rm -r ${THEME_TARGET_DIR}/css/*
	@echo -e ${GIT_IGNORE} > ${THEME_TARGET_DIR}/css/.gitignore
	rm -r ${THEME_TARGET_DIR}/img/*
	@echo -e ${GIT_IGNORE} > ${THEME_TARGET_DIR}/img/.gitignore
	rm -r ${THEME_TARGET_DIR}/js/libs/bootstrap/*
	@echo -e ${GIT_IGNORE} > ${THEME_TARGET_DIR}/js/libs/bootstrap/.gitignore


#
# BUILD THEME DIRECTORY
# recess & uglifyjs are required
#

theme: theme-img theme-font theme-css theme-js


#
# JS COMPILE
#

theme-js: ${BOOTSTRAP_JS_TARGET_DIR}/*.js

${BOOTSTRAP_JS_TARGET_DIR}/*.js: ${BOOTSTRAP_SOURCE_DIR}/js/*.js
	mkdir -p ${BOOTSTRAP_JS_TARGET_DIR}

	# Original Bootstrap
	cat ${BOOTSTRAP_SOURCE_DIR}/js/bootstrap-transition.js ${BOOTSTRAP_SOURCE_DIR}/js/bootstrap-alert.js ${BOOTSTRAP_SOURCE_DIR}/js/bootstrap-button.js ${BOOTSTRAP_SOURCE_DIR}/js/bootstrap-carousel.js ${BOOTSTRAP_SOURCE_DIR}/js/bootstrap-collapse.js ${BOOTSTRAP_SOURCE_DIR}/js/bootstrap-dropdown.js ${BOOTSTRAP_SOURCE_DIR}/js/bootstrap-modal.js ${BOOTSTRAP_SOURCE_DIR}/js/bootstrap-tooltip.js ${BOOTSTRAP_SOURCE_DIR}/js/bootstrap-popover.js ${BOOTSTRAP_SOURCE_DIR}/js/bootstrap-scrollspy.js ${BOOTSTRAP_SOURCE_DIR}/js/bootstrap-tab.js ${BOOTSTRAP_SOURCE_DIR}/js/bootstrap-typeahead.js ${BOOTSTRAP_SOURCE_DIR}/js/bootstrap-inputmask.js ${BOOTSTRAP_SOURCE_DIR}/js/bootstrap-rowlink.js ${BOOTSTRAP_SOURCE_DIR}/js/bootstrap-fileupload.js ${BOOTSTRAP_SOURCE_DIR}/js/bootstrap-affix.js > ${BOOTSTRAP_JS_TARGET_DIR}/bootstrap.js
	${NODE_BIN_DIR}/uglifyjs -nc ${BOOTSTRAP_JS_TARGET_DIR}/bootstrap.js > ${BOOTSTRAP_JS_TARGET_DIR}/bootstrap.min.tmp.js
	echo "/*!\n* Bootstrap.js by @fat & @mdo extended by @ArnoldDaniels\n* Copyright 2012 Twitter, Inc.\n* http://www.apache.org/licenses/LICENSE-2.0.txt\n*/" > ${BOOTSTRAP_JS_TARGET_DIR}/copyright.js
	cat ${BOOTSTRAP_JS_TARGET_DIR}/copyright.js ${BOOTSTRAP_JS_TARGET_DIR}/bootstrap.min.tmp.js > ${BOOTSTRAP_JS_TARGET_DIR}/bootstrap.min.js
	rm ${BOOTSTRAP_JS_TARGET_DIR}/copyright.js ${BOOTSTRAP_JS_TARGET_DIR}/bootstrap.min.tmp.js

	# Jasny
	cat ${BOOTSTRAP_SOURCE_DIR}/js/bootstrap-typeahead.js ${BOOTSTRAP_SOURCE_DIR}/js/bootstrap-inputmask.js ${BOOTSTRAP_SOURCE_DIR}/js/bootstrap-rowlink.js ${BOOTSTRAP_SOURCE_DIR}/js/bootstrap-fileupload.js > ${BOOTSTRAP_JS_TARGET_DIR}/jasny-bootstrap.js
	${NODE_BIN_DIR}/uglifyjs -nc ${BOOTSTRAP_JS_TARGET_DIR}/jasny-bootstrap.js > ${BOOTSTRAP_JS_TARGET_DIR}/jasny-bootstrap.min.tmp.js
	echo "/*!\n* Jasny-bootstrap.js by @ArnoldDaniels\n* Copyright 2012 Arnold Daniels\n* http://www.apache.org/licenses/LICENSE-2.0.txt\n*/" > ${BOOTSTRAP_JS_TARGET_DIR}/copyright.js
	cat ${BOOTSTRAP_JS_TARGET_DIR}/copyright.js ${BOOTSTRAP_JS_TARGET_DIR}/jasny-bootstrap.min.tmp.js > ${BOOTSTRAP_JS_TARGET_DIR}/jasny-bootstrap.min.js
	rm ${BOOTSTRAP_JS_TARGET_DIR}/copyright.js ${BOOTSTRAP_JS_TARGET_DIR}/jasny-bootstrap.min.tmp.js


#
# CSS COMPLILE
#

theme-css: ${THEME_TARGET_DIR}/css/*.css

${THEME_TARGET_DIR}/css/*.css: ${BOOTSTRAP_SOURCE_DIR}/less/*.less ${THEME_LESS_SOURCE_DIR}/*.less
	mkdir -p ${THEME_TARGET_DIR}/css
	${NODE_BIN_DIR}/recess --compile ${THEME_LESS} > ${THEME_TARGET_DIR}/css/theme.css
	${NODE_BIN_DIR}/recess --compress ${THEME_LESS} ${JASNY_BOOTSTRAP_LESS} ${BOOTSTRAP_LESS} > ${THEME_TARGET_DIR}/css/theme.min.css
	# Should add theme-responsive.less?
	${NODE_BIN_DIR}/recess --compile ${JASNY_BOOTSTRAP_RESPONSIVE_LESS} ${BOOTSTRAP_RESPONSIVE_LESS} > ${THEME_TARGET_DIR}/css/theme-responsive.css
	${NODE_BIN_DIR}/recess --compress ${JASNY_BOOTSTRAP_RESPONSIVE_LESS} ${BOOTSTRAP_RESPONSIVE_LESS} > ${THEME_TARGET_DIR}/css/theme-responsive.min.css


#
# IMAGES
#

theme-img: ${THEME_TARGET_DIR}/img/*

${THEME_TARGET_DIR}/img/*: ${BOOTSTRAP_SOURCE_DIR}/img/* ./img/*
	mkdir -p ${THEME_TARGET_DIR}/img
	cp ${BOOTSTRAP_SOURCE_DIR}/img/* ${THEME_TARGET_DIR}/img/
	cp ./img/* ${THEME_TARGET_DIR}/img/

#
# FONTS
#

theme-font: ${THEME_TARGET_DIR}/font/*

${THEME_TARGET_DIR}/font/*: ${BOOTSTRAP_SOURCE_DIR}/font/* ./font/*
	mkdir -p ${THEME_TARGET_DIR}/font
	cp ${BOOTSTRAP_SOURCE_DIR}/font/* ${THEME_TARGET_DIR}/font/
	cp ./font/* ${THEME_TARGET_DIR}/font/



#
# WATCH LESS FILES
# Needs Ruby installed (as this "watchr" is the ruby gem, not the node module)

watch:
	echo "Watching less files..."; \
	watchr -e "watch('\${BOOTSTRAP_SOURCE_DIR}/less/.*\.less') { system 'make theme-css' }"
	watchr -e "watch('less/.*\.less') { system 'make theme-css' }"


.PHONY: watch theme-img theme-css theme-js
