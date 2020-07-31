from django import forms

from money.models import Movement

class AddMovementForm(forms.ModelForm):
    class Meta:
        model = Movement
        fields = ('source_description', 'destination_description', 'amount')