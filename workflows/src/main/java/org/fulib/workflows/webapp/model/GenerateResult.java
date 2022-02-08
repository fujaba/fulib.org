package org.fulib.workflows.webapp.model;

import java.util.Map;

public class GenerateResult {
    private String board;
    private Map<Integer, String> pages;
    private int numberOfPages = 0;
    private Map<Integer, String> diagrams;
    private int numberOfDiagrams = 0;
    private Map<Integer, String> fxmls;
    private int numberOfFxmls = 0;
    private String classDiagram;

    public String getBoard() {
        return board;
    }

    public void setBoard(String board) {
        this.board = board;
    }

    public Map<Integer, String> getPages() {
        return pages;
    }

    public void setPages(Map<Integer, String> pages) {
        this.pages = pages;
    }

    public int getNumberOfPages() {
        return numberOfPages;
    }

    public void setNumberOfPages(int numberOfPages) {
        this.numberOfPages = numberOfPages;
    }

    public Map<Integer, String> getDiagrams() {
        return diagrams;
    }

    public void setDiagrams(Map<Integer, String> diagrams) {
        this.diagrams = diagrams;
    }

    public int getNumberOfDiagrams() {
        return numberOfDiagrams;
    }

    public void setNumberOfDiagrams(int numberOfDiagrams) {
        this.numberOfDiagrams = numberOfDiagrams;
    }

    public int getNumberOfFxmls() {
        return numberOfFxmls;
    }

    public void setNumberOfFxmls(int numberOfFxmls) {
        this.numberOfFxmls = numberOfFxmls;
    }

    public Map<Integer, String> getFxmls() {
        return fxmls;
    }

    public void setFxmls(Map<Integer, String> fxmls) {
        this.fxmls = fxmls;
    }

    public String getClassDiagram() {
        return classDiagram;
    }

    public void setClassDiagram(String classDiagram) {
        this.classDiagram = classDiagram;
    }
}
