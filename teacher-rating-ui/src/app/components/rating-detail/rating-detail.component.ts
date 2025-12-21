import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Rating } from 'src/app/models/rating.model';
import { RatingService } from 'src/app/services/rating.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rating-detail',
  templateUrl: './rating-detail.component.html',
  styleUrls: ['./rating-detail.component.css']
})
export class RatingDetailComponent implements OnInit {
  rating: Rating | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private ratingService: RatingService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRating(Number(id));
    }
  }

  loadRating(id: number): void {
    this.isLoading = true;
    this.ratingService.getRatingById(id).subscribe({
      next: (rating) => {
        this.rating = rating;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Ошибка при загрузке данных оценки');
        this.isLoading = false;
      }
    });
  }

  getFormattedDate(date: Date): string {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStarArray(score: number): number[] {
    return Array(5).fill(0).map((_, i) => i < score ? 1 : 0);
  }
}