from django.shortcuts import render
from django.views.generic.base import TemplateView
from django.views.generic.edit import FormMixin

from money.forms import AddMovementForm


class AddMovementView(TemplateView, FormMixin):
    """
    View to add a money movement
    """
    template_name = "money/add_movement.html"
    form_class = AddMovementForm

    def post(self, request, *args, **kwargs):
        form = self.get_form()
        if form.is_valid():
            movement = form.save(commit=False)

            # movement.save()

        return super().post(request, form, *args, **kwargs)
