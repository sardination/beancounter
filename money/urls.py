from django.urls import path

from money import views

urlpatterns = [
    path('add_movement/', views.AddMovementView.as_view(), name='add_movement'),
]