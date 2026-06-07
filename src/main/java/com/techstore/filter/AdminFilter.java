package com.techstore.filter;

import com.techstore.util.JsonResponse;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

@WebFilter("/admin/*")
public class AdminFilter implements Filter {

    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response,
            FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;

        HttpServletResponse httpResponse = (HttpServletResponse) response;

        HttpSession session = httpRequest.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {

            JsonResponse.sendError(httpResponse, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");

            return;
        }

        Object role = session.getAttribute("userRole");

        if (!"ADMIN".equals(role)) {

            JsonResponse.sendError(httpResponse, HttpServletResponse.SC_FORBIDDEN, "Admin access required");

            return;
        }

        chain.doFilter(request, response);
    }
}