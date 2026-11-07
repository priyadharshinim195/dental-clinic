from django.contrib import admin

from apps.website_settings.models import SiteContent, SiteSettings

admin.site.register(SiteSettings)


@admin.register(SiteContent)
class SiteContentAdmin(admin.ModelAdmin):
    list_display = ("key", "group", "updated_at")
    search_fields = ("key", "label", "value")
