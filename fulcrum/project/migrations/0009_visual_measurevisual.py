# Generated by Django 4.0.6 on 2022-07-28 15:59

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('project', '0008_alter_parameter_parameter_char'),
    ]

    operations = [
        migrations.CreateModel(
            name='Visual',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100)),
                ('type', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='MeasureVisual',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_date', models.DateField(null=True)),
                ('end_date', models.DateField(null=True)),
                ('collect', models.CharField(max_length=100, null=True)),
                ('style_color', models.CharField(max_length=100, null=True)),
                ('measure', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='project.measure')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='project.project')),
                ('visual', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='measurevisuals', to='project.visual')),
            ],
        ),
    ]
