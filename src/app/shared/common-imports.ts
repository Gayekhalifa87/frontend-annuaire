// Imports communs pour les standalone components
export { CommonModule } from '@angular/common';
export { FormsModule, ReactiveFormsModule } from '@angular/forms';
export { RouterModule, Router } from '@angular/router';

// Réexporter les types Angular fréquemment utilisés
export type { OnInit, OnDestroy } from '@angular/core';
export { Component, Injectable, Input, Output, EventEmitter } from '@angular/core';

// Réexporter les interfaces du core
export type { Employee, PaginationInfo, SearchFilters } from '../core/models/employee.interface';