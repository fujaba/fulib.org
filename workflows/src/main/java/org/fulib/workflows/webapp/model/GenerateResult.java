package org.fulib.workflows.webapp.model;

import java.util.List;

public class GenerateResult {
    private String board;
    private List<String> pages;
    private List<String> diagrams;
    private List<String> fxmls;
    private String classDiagram;

    public String getBoard() {
        return board;
    }

    public void setBoard(String board) {
        this.board = board;
    }


    public String getClassDiagram() {
        return classDiagram;
    }

    public void setClassDiagram(String classDiagram) {
        this.classDiagram = classDiagram;
    }

    public List<String> getPages() {
        return pages;
    }

    public void setPages(List<String> pages) {
        this.pages = pages;
    }

    public List<String> getDiagrams() {
        return diagrams;
    }

    public void setDiagrams(List<String> diagrams) {
        this.diagrams = diagrams;
    }

    public List<String> getFxmls() {
        return fxmls;
    }

    public void setFxmls(List<String> fxmls) {
        this.fxmls = fxmls;
    }
}
