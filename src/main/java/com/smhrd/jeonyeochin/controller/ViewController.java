package com.smhrd.jeonyeochin.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ViewController {
    @RequestMapping("/")
    public String root() {
        return "forward:/intro/intro.html";
    }
}
