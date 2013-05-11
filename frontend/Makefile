THEME_DIR = ./theme

JADE_VIEWS_SOURCE_DIR = ./views
JADE_VIEWS_TARGET_DIR = ./public/js/views

DATE=$(shell date +%I:%M%p)
NODE_BIN_DIR = ../node_modules/.bin

GIT_IGNORE = "*\n!.gitignore"

all: jade

#
# CLEANS PRIOR BUILDS
#

clean:
	rm -r ${JADE_VIEWS_TARGET_DIR}/*
	@echo -e ${GIT_IGNORE} > ${JADE_VIEWS_TARGET_DIR}/.gitignore


#
# PRECOMPILE JADE FILES
#

JADE_SOURCE_FILES = $(shell find ${JADE_VIEWS_SOURCE_DIR} -type f -name '*.jade')
JADE_TARGET_FILES = $(patsubst ${JADE_VIEWS_SOURCE_DIR}/%.jade, ${JADE_VIEWS_TARGET_DIR}/%.js, $(JADE_SOURCE_FILES))

jade: $(JADE_TARGET_FILES)

${JADE_VIEWS_TARGET_DIR}/%.js: ${JADE_VIEWS_SOURCE_DIR}/%.jade
	@mkdir -p "$(@D)"
	@node build/precompileJade.js "$<" "$@"


.PHONY: clean all
