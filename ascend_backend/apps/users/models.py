import uuid

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra):
        extra.setdefault("role", "admin")
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra)


class User(AbstractBaseUser, PermissionsMixin):
    TIER_CHOICES = [
        ("Explorer", "Explorer"),
        ("Achiever", "Achiever"),
        ("Master", "Master"),
        ("Luminary", "Luminary"),
    ]
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("member", "Member"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="member")
    tier = models.CharField(max_length=10, choices=TIER_CHOICES, default="Explorer")
    xp = models.PositiveIntegerField(default=0)
    vouchers = models.PositiveIntegerField(default=0)
    joined = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.email

    @property
    def initials(self):
        parts = self.name.split()
        return "".join(p[0].upper() for p in parts[:2] if p)

    def recalculate_tier(self):
        if self.xp >= 10000:
            self.tier = "Luminary"
        elif self.xp >= 5000:
            self.tier = "Master"
        elif self.xp >= 1000:
            self.tier = "Achiever"
        else:
            self.tier = "Explorer"


@receiver(post_save, sender=User)
def update_tier_on_xp_change(sender, instance, **kwargs):
    new_tier = (
        "Luminary" if instance.xp >= 10000
        else "Master" if instance.xp >= 5000
        else "Achiever" if instance.xp >= 1000
        else "Explorer"
    )
    if instance.tier != new_tier:
        User.objects.filter(pk=instance.pk).update(tier=new_tier)
