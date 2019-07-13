from django.shortcuts import render
from django.views.generic.base import TemplateView


class AddMovementView(TemplateView):
    """
    View to add a money movement
    """
    template_name = "base.html"
