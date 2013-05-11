#
# One Makefile to rule them all.
#
FRONTEND_DIR = ./frontend
FRONTEND_THEME_DIR = ${FRONTEND_DIR}/theme

DATE=$(shell date +%I:%M%p)
HR=\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#

NODE_BIN_DIR = node_modules/.bin

all:
	@echo -e "\n${HR}\n"
	@cd ${FRONTEND_DIR} && make all
	@echo -e "\n${HR}\n"
	@cd ${FRONTEND_THEME_DIR} && make all
	@echo -e "\n${HR}\n"
	@echo Done!

clean:
	@echo -e "\n${HR}\n"
	@cd ${FRONTEND_DIR} && make clean
	@echo -e "\n${HR}\n"
	@cd ${FRONTEND_THEME_DIR} && make clean
	@echo -e "\n${HR}\n"
	@echo Cleaned!

.PHONY: clean all