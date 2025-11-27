import {
  OnInit,
  OnDestroy,
  AfterViewInit,
  signal,
  ViewChild,
  Directive
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

/**
 * Generic base component for CRUD management interfaces
 * Provides common functionality for data listing, searching, sorting, and CRUD operations
 *
 * Subclasses should:
 * 1. Define T (the data model type)
 * 2. Implement getDisplayedColumns(): string[]
 * 3. Implement loadData(): void
 * 4. Implement filter(items: T[], query: string): T[]
 * 5. Override any specific lifecycle hooks if needed
 */
@Directive()
export abstract class BaseCrudManagementComponent<T extends { id?: number }> implements OnInit, OnDestroy, AfterViewInit {
  /** Signal holding the raw data items */
  protected items = signal<T[]>([]);

  /** Signal holding the current search query */
  searchQuery = signal('');

  /** Signal for loading state */
  isLoading = signal(false);

  /** Signal for error state */
  error = signal<string | null>(null);

  /** Material table data source for sorting and pagination */
  dataSource = new MatTableDataSource<T>();

  /** Columns to display in the table */
  abstract displayedColumns: string[];

  /** Reference to MatSort directive for table sorting */
  @ViewChild(MatSort) sort!: MatSort;

  /** Subject for managing subscription cleanup */
  protected readonly destroy$ = new Subject<void>();

  constructor(protected readonly router: Router) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Subclasses must implement to load data from service
   */
  protected abstract loadData(): void;

  /**
   * Subclasses must implement to define custom filtering logic
   * @param items The items to filter
   * @param query The search query
   * @returns Filtered items
   */
  protected abstract filter(items: T[], query: string): T[];

  /**
   * Handles search input changes
   */
  onSearch(): void {
    this.updateDataSource();
  }

  /**
   * Updates the data source with filtered items
   */
  protected updateDataSource(): void {
    this.dataSource.data = this.getFilteredItems();
  }

  /**
   * Returns filtered items based on current search query
   */
  protected getFilteredItems(): T[] {
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      return this.items();
    }
    return this.filter(this.items(), query);
  }

  /**
   * Helper method to set items and update data source
   * @param newItems The new items to set
   */
  protected setItems(newItems: T[]): void {
    this.items.set(newItems);
    this.updateDataSource();
  }

  /**
   * Helper method to update items (additive)
   * @param updateFn Function to update the items array
   */
  protected updateItems(updateFn: (items: T[]) => T[]): void {
    this.items.update(updateFn);
    this.updateDataSource();
  }

  /**
   * Sets the loading state
   */
  protected setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }

  /**
   * Sets an error message
   */
  protected setError(message: string | null): void {
    this.error.set(message);
  }

  /**
   * Clears error message
   */
  protected clearError(): void {
    this.error.set(null);
  }

  /**
   * Confirms deletion with user
   * @returns true if user confirmed, false otherwise
   */
  protected confirmDeletion(itemName?: string): boolean {
    const message = itemName
      ? `Êtes-vous sûr de vouloir supprimer "${itemName}" ?`
      : 'Êtes-vous sûr de vouloir supprimer cet élément ?';
    return confirm(message);
  }

  /**
   * Helper for navigating to create form
   */
  protected navigateToCreate(path: string): void {
    this.router.navigate([path]);
  }

  /**
   * Helper for navigating to edit form
   */
  protected navigateToEdit(path: string, id: number | undefined): void {
    if (id) {
      this.router.navigate([path, id, 'edit']);
    }
  }

  /**
   * Helper for navigating to detail view
   */
  protected navigateToDetail(path: string, id: number | undefined): void {
    if (id) {
      this.router.navigate([path, id]);
    }
  }
}
