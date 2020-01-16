#include <stdio.h>
<%headers.map(header=>{%>
<%=header%><%})%>
<% globals.map(line=>{%>
<%=line%><%})%>
<% functions.map(line=>{%>
<%=line%><%})%>
void app_main(void)
{
  printf("Hello world!\n");
  <% tasks.map(line=>{%>
  <%=line%><%})%>
}
