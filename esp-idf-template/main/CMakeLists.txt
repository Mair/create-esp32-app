set(COMPONENT_SRCS <% if(isCpp)print("\"main.cpp\""); else print("\"main.c\"");  %> )
set(COMPONENT_ADD_INCLUDEDIRS ".")

register_component()