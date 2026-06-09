package com.techstore.filter;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebFilter("/*")
public class CORSFilter implements Filter {

    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response,
            FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;

        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String origin = httpRequest.getHeader("Origin");
        String allowedOrigin = request.getServletContext().getInitParameter("cors.allowed.origin");

        if (origin != null && allowedOrigin != null && origin.matches(allowedOrigin)) {
            httpResponse.setHeader("Access-Control-Allow-Origin", origin);
            httpResponse.setHeader("Access-Control-Allow-Credentials", "true");
        } else if (allowedOrigin != null && "*".equals(allowedOrigin)) {
            httpResponse.setHeader("Access-Control-Allow-Origin", "*");
        }


        httpResponse.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

        httpResponse.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

        httpResponse.setHeader("Access-Control-Max-Age", "3600");

        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {

            httpResponse.setStatus(HttpServletResponse.SC_OK);

            return;
        }

        chain.doFilter(request, response);
    }
}